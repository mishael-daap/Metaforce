ALTER TABLE conversations
  ADD COLUMN summary TEXT,
  ADD COLUMN last_summarized_index INT DEFAULT 0;
