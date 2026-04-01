package proxy

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	commonpb "go.opentelemetry.io/proto/otlp/common/v1"
	"google.golang.org/protobuf/proto"
)

type Forwarder struct {
	collectorAddr string
	client        *http.Client
}

func NewForwarder(collectorAddr string) *Forwarder {
	return &Forwarder{
		collectorAddr: collectorAddr,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// InjectTenantAndForwardTraces deserializes the OTLP trace payload, injects
// anchor.tenant_id into each resource, and forwards to the collector.
func (f *Forwarder) InjectTenantAndForwardTraces(body []byte, tenantID string, contentType string) (int, []byte, error) {
	if contentType == "application/x-protobuf" || contentType == "application/protobuf" {
		return f.forwardProtobufTraces(body, tenantID)
	}
	// For JSON payloads or unknown types, forward as-is with a header hint.
	// The collector can handle the tenant_id from a resource attribute we add
	// at the SDK level in the future, or we parse JSON here later.
	return f.forwardRaw(body, "/v1/traces", contentType)
}

func (f *Forwarder) forwardProtobufTraces(body []byte, tenantID string) (int, []byte, error) {
	var req coltracepb.ExportTraceServiceRequest
	if err := proto.Unmarshal(body, &req); err != nil {
		return http.StatusBadRequest, nil, fmt.Errorf("unmarshal trace request: %w", err)
	}

	tenantAttr := &commonpb.KeyValue{
		Key: "anchor.tenant_id",
		Value: &commonpb.AnyValue{
			Value: &commonpb.AnyValue_StringValue{StringValue: tenantID},
		},
	}

	for _, rs := range req.ResourceSpans {
		if rs.Resource == nil {
			continue
		}
		rs.Resource.Attributes = append(rs.Resource.Attributes, tenantAttr)
	}

	modified, err := proto.Marshal(&req)
	if err != nil {
		return http.StatusInternalServerError, nil, fmt.Errorf("marshal modified request: %w", err)
	}

	return f.forwardRaw(modified, "/v1/traces", "application/x-protobuf")
}

// ForwardRaw forwards a raw payload to the collector at the given path.
func (f *Forwarder) ForwardRaw(body []byte, path, contentType string) (int, []byte, error) {
	return f.forwardRaw(body, path, contentType)
}

func (f *Forwarder) forwardRaw(body []byte, path, contentType string) (int, []byte, error) {
	url := f.collectorAddr + path

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return http.StatusInternalServerError, nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Content-Type", contentType)

	resp, err := f.client.Do(req)
	if err != nil {
		log.Error().Err(err).Str("url", url).Msg("collector request failed")
		return http.StatusBadGateway, nil, fmt.Errorf("forwarding to collector: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, respBody, nil
}
