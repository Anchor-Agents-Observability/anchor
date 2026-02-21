import { Resend } from 'resend'
import { NodeHandler, NodeConfig, ExecutionContext, NodeResult } from '../types'

interface EmailConfig extends NodeConfig {
  to: string
  subject: string
  body: string
  apiKey: string
  from?: string
}

export class EmailHandler implements NodeHandler {
  async execute(config: EmailConfig, context: ExecutionContext): Promise<NodeResult> {
    try {
      if (!config.apiKey) {
        return {
          success: false,
          error: 'Resend API key is required'
        }
      }

      if (!config.to) {
        return {
          success: false,
          error: 'Recipient email is required'
        }
      }

      if (!config.subject) {
        return {
          success: false,
          error: 'Email subject is required'
        }
      }

      if (!config.body) {
        return {
          success: false,
          error: 'Email body is required'
        }
      }

      const resend = new Resend(config.apiKey)

      const startTime = Date.now()

      const result = await resend.emails.send({
        from: config.from || 'noreply@your-domain.com', // You'll need to configure this
        to: config.to,
        subject: config.subject,
        html: this.formatEmailBody(config.body)
      })

      const duration = Date.now() - startTime

      if (result.error) {
        return {
          success: false,
          error: `Email send failed: ${result.error.message}`
        }
      }

      return {
        success: true,
        output: {
          status: 'sent',
          messageId: result.data?.id,
          to: config.to,
          subject: config.subject
        },
        duration
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      }
    }
  }

  private formatEmailBody(body: string): string {
    // Simple formatting: convert newlines to <br> tags
    // In a real implementation, you might want more sophisticated formatting
    return body.replace(/\n/g, '<br>')
  }
}