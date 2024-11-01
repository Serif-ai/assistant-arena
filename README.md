AssistantArena is our take on an anonymous evaluation metric to test personalized assistants.

While tools like Chatbot Arena exist for testing foundational models and SWE Bench + plenty more benchmarks exist to evaluate coding agents, evaluating personalized assistants requires a lot more context.

Unlike foundational models that are “stateless” and have a unified "text in, text out" API, assistants are often personalized for each user and have different interfaces (for example generating emails via a Chrome Extension vs API). AssistantArena aims to address this by curating and sharing public datasets for different assistant capabilities, starting with email, and hosting an open source evaluation tool where the community can rank assistants.

Every quarter, we'll release new datasets of sample inboxes and collaborate with developers of assistants to generate 50 test responses for each inbox. These responses will reply to emails sent to the inbox owner, with the owner's actual response hidden from the model and saved as "ground truth" for later comparison.

Once all submissions are collected, the responses will be compiled into a blind dataset. The community will then vote on which response is the best. To provide context during voting, voters will see the entire email thread (for threads with multiple emails) and the actual "ground truth" email sent by the inbox owner.

This first iteration will use three inboxes—one personal, one work, and one for customer support—along with four of the most popular email assistants (Gemini, Superhuman, Microsoft Copilot, and Serif).