import dotenv from "dotenv";
dotenv.config();

export const channelID = process.env.CHANNEL_ID;
export const botId = process.env.BOT_ID;
export const privateChannelId = process.env.PRIVATE_CHANNEL_ID;
export const initialState = () => ({
  task: null,
  question: null,
  answer: null,
  questionCategory: null,
  anonymousMode: null,
  questionId: null,
  materialName: null,
  materialCategory: null,
  materialType: null,
  firstName: null,
  lastName: null,
  grade: null,
  dbId: null,
});

export const commands = [
  { command: "start", description: "Start the bot" },
  { command: "register", description: "Sign Up to our bot" },
  { command: "ask", description: "post question to our channel" },
  { command: "materials", description: "Get learning materials" },
  { command: "help", description: "Get help with the bot" },
  { command: "about", description: "Learn more about the bot" },
];

export const gradeKeyboard = {
  keyboard: [
    ["1", "2", "3", "4"],
    ["5", "6", "7", "8"],
    ["9", "10", "11", "12"],
    ["University"],
  ],
};

export const subjects = [
  "Biology",
  "Chemistery",
  "Math",
  "Physics",
  "English",
  "Civic",
  "History",
];

export const types = [
  "Note",
  "Presentation",
  "Project",
  "Exam",
  "Worksheet",
  "Media",
];
export const subjectKeyboard = [
  [
    {
      text: "Biology",
      callback_data: "Biology",
    },
    {
      text: "Chemistery",
      callback_data: "Chemistery",
    },
  ],
  [
    {
      text: "Math",
      callback_data: "Math",
    },
    {
      text: "Physics",
      callback_data: "Physics",
    },
  ],
  [
    {
      text: "English",
      callback_data: "English",
    },
    {
      text: "Amharic",
      callback_data: "Amharic",
    },
  ],
  [
    {
      text: "Civic",
      callback_data: "Civic",
    },
    {
      text: "History",
      callback_data: "History",
    },
  ],
];

export const materialTypesKeyboard = [
  [
    {
      text: "Note",
      callback_data: "Note",
    },
    {
      text: "Presentation",
      callback_data: "Presentation",
    },
  ],
  [
    {
      text: "Exam",
      callback_data: "Exam",
    },
    {
      text: "Worksheet",
      callback_data: "Worksheet",
    },
  ],
  [
    {
      text: "Project",
      callback_data: "Project",
    },
    {
      text: "Media",
      callback_data: "Media",
    },
  ],
];
export const resetState = (ctx) => {
  ctx.session.task = null;
  ctx.session.question = null;
  ctx.session.answer = null;
  ctx.session.questionCategory = null;
  ctx.session.anonymousMode = null;
  ctx.session.questionId = null;
  ctx.session.materialCategory = null;
  ctx.session.materialName = null;
  ctx.session.materialType = null;
};
