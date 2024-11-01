# AssistantArena 🏆

An open-source platform for evaluating personalized AI assistants through anonymous community benchmarking.

## Overview

While tools like Chatbot Arena excel at testing foundational models, and benchmarks like SWE Bench evaluate coding agents, there's a gap in evaluating personalized AI assistants. These assistants often:
- Are customized for individual users
- Have diverse interfaces (Chrome extensions, APIs, etc.)
- Maintain user-specific context and state

AssistantArena addresses this challenge by providing curated public datasets and an open-source evaluation framework for ranking assistant capabilities.

## How It Works

### Quarterly Evaluation Cycle

1. **Dataset Release**: We publish sample inboxes representing different use cases
2. **Assistant Testing**: Developers generate 50 test responses per inbox
3. **Blind Evaluation**: Community votes on anonymized responses
4. **Context-Rich Voting**: Voters see full email threads and "ground truth" responses

### Current Evaluation Scope

**Test Inboxes:**
- Personal Communications
- Professional Workplace
- Customer Support

**Featured Assistants:**
- Gemini
- Superhuman
- Microsoft Copilot
- Serif

## Why AssistantArena?

Unlike traditional "text in, text out" model evaluations, AssistantArena recognizes that modern AI assistants are deeply integrated into user workflows and require contextual evaluation. Our platform enables fair, comprehensive assessment of real-world assistant performance.