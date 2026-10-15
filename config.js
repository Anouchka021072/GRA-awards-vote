// Single source of truth for the awards. Edit this file, then redeploy.
// Shared by the voting page (through /api/config) and by the server checks.

export const CONFIG = {
  org: "GRA",
  // 1 December 2026, 17:00 Mauritius time. Votes are refused after this moment.
  closing: "2026-12-01T17:00:00+04:00",

  values: ["Incorruptibility", "Meritocracy", "Impartiality"],
  vision:
    "A world-class, forward-looking, innovative and dynamic regulatory body, based on the fundamental principles of incorruptibility, meritocracy and impartiality.",

  awards: [
    {
      id: "compass",
      name: "The Compass",
      hue: "--compass",
      honours: "The person who best embodies integrity and professional attitude.",
      mission:
        "Every employee maintains high standards of personal conduct and integrity, and conducts themselves with propriety and is seen to do so.",
      criteria: ["Personal conduct and integrity"],
      prompts: [
        "Describe a moment when this person chose the right thing over the easy thing.",
        "What did that show you about how they work?"
      ]
    },
    {
      id: "quiet",
      name: "The Quiet Force",
      hue: "--quiet",
      honours: "The person who lightens the workload of others.",
      mission: "Deliver prompt and efficient services.",
      criteria: ["Prompt and efficient service"],
      prompts: [
        "Describe a time this person made your work, or a colleague's, lighter.",
        "What difference did it make to you or the team?"
      ]
    },
    {
      id: "fair",
      name: "The Fair Play Award",
      hue: "--fair",
      honours: "The person recognised for impartiality, fairness and transparency.",
      mission: "Ensure gambling activities are conducted fairly and transparently.",
      criteria: ["Fair and transparent operations"],
      prompts: [
        "Describe a situation where this person acted impartially or openly.",
        "Why did their fairness matter in that moment?"
      ]
    }
  ],

  // Replace with GRA's real departments.
  departments: ["Licensing", "Compliance", "Inspection", "Finance", "Legal", "IT", "Human Resources", "Administration", "Other"],

  // Optional: paste the staff list here to offer name suggestions while typing.
  // Format: { name: "First Surname", dept: "Licensing" }. Anyone can still be named freely.
  staff: [],

  // Number of codes issued, used for the participation percentage.
  headcount: 100
};
