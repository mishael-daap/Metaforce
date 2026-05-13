  -- Modify messages table to store full UIMessage format
  ALTER TABLE messages
    DROP COLUMN role,
    DROP COLUMN content,
    ADD COLUMN ui_message JSONB NOT NULL;