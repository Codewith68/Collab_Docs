import { describe, it, expect } from 'vitest';
import { 
  createDocumentSchema, 
  updateDocumentSchema, 
  addCollaboratorSchema,
  syncPayloadSchema,
  MAX_TITLE_LENGTH,
  MAX_SYNC_PAYLOAD_SIZE
} from './document';

describe('Document Validators', () => {
  describe('createDocumentSchema', () => {
    it('validates a correct payload', () => {
      const result = createDocumentSchema.safeParse({
        title: 'My Document',
        initialContent: '<p>Hello world</p>'
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty title', () => {
      const result = createDocumentSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title is required');
      }
    });

    it('rejects a title that is too long', () => {
      const longTitle = 'a'.repeat(MAX_TITLE_LENGTH + 1);
      const result = createDocumentSchema.safeParse({ title: longTitle });
      expect(result.success).toBe(false);
    });
  });

  describe('updateDocumentSchema', () => {
    it('validates a correct payload', () => {
      const result = updateDocumentSchema.safeParse({
        title: 'Updated Title'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('addCollaboratorSchema', () => {
    it('validates correct email and role', () => {
      const result = addCollaboratorSchema.safeParse({
        email: 'test@example.com',
        role: 'EDITOR'
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = addCollaboratorSchema.safeParse({
        email: 'not-an-email',
        role: 'VIEWER'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Valid email is required');
      }
    });

    it('rejects invalid role', () => {
      const result = addCollaboratorSchema.safeParse({
        email: 'test@example.com',
        role: 'ADMIN' // Invalid role
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Role must be EDITOR or VIEWER');
      }
    });
  });

  describe('syncPayloadSchema', () => {
    it('validates a standard update payload', () => {
      const result = syncPayloadSchema.safeParse({
        type: 'update',
        data: 'base64encodedstring',
        documentId: 'doc-123'
      });
      expect(result.success).toBe(true);
    });

    it('rejects payloads exceeding the size limit', () => {
      const result = syncPayloadSchema.safeParse({
        type: 'update',
        data: 'a'.repeat(MAX_SYNC_PAYLOAD_SIZE + 1),
        documentId: 'doc-123'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Sync payload too large — possible OOM attack');
      }
    });
  });
});
