import { Mail, Users, BarChart3, Calendar } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6">
          AssistantArena
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
          An anonymous evaluation platform for personalized AI assistants,
          bringing transparency and community-driven insights to assistant
          performance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              While tools like Chatbot Arena exist for testing foundational
              models and various benchmarks evaluate coding agents, evaluating
              personalized assistants requires deeper context. AssistantArena
              addresses this challenge by curating public datasets and providing
              an open-source evaluation platform for the community.
            </p>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: "Quarterly Updates",
                description:
                  "New datasets of sample inboxes released every quarter, collaborating with assistant developers.",
              },
              {
                icon: Mail,
                title: "Email Testing",
                description:
                  "Assistants generate 50 test responses for each inbox, with original responses saved as ground truth.",
              },
              {
                icon: Users,
                title: "Community Voting",
                description:
                  "Blind evaluation where the community votes on the best responses with full context provided.",
              },
              {
                icon: BarChart3,
                title: "Transparent Results",
                description:
                  "Compare responses across personal, work, and customer support scenarios.",
              },
            ].map((card, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <card.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </section>

          <section className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              First Iteration
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Our initial evaluation focuses on three distinct inbox types:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
                <li>Personal Email Management</li>
                <li>Professional Work Communication</li>
                <li>Customer Support Interactions</li>
              </ul>
              <p className="text-gray-600 mt-4">Featured Assistants:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
                <li>Gemini</li>
                <li>Superhuman</li>
                <li>Microsoft Copilot</li>
                <li>Serif</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
