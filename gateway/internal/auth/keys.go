package auth

import (
	"crypto/rand"
	"encoding/hex"
)

func GenerateAPIKey() (plain string, hash string, err error) {
	raw := make([]byte, 24)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}

	plain = "ward_" + hex.EncodeToString(raw)
	return plain, HashAPIKey(plain), nil
}
