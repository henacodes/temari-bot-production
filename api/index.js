import { Bot, session, webhookCallback } from "grammy";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

import {
  gradeKeyboard,
  initialState,
  commands,
  subjectKeyboard,
  subjects,
  materialTypesKeyboard,
  types,
} from "./utils/constants.js";
import {
  postQuestion,
  confirmPost,
  extractParams,
} from "./utils/questionUtils.js";
import { createUser, isMember, authUserMiddleware } from "./utils/userUtils.js";
import { confirmPostMessage, welcomeMessage } from "./utils/messageUtils.js";
import { fetchAnswers, postAnswer } from "./utils/answerUtils.js";
import { fetchMaterials, postMaterial } from "./utils/materialUtils.js";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

bot.api.setMyCommands(commands);
// middlewares
bot.use(session({ initial: initialState }));
bot.use(isMember);
bot.use(authUserMiddleware);
// commands
bot.command("start", async (ctx) => {
  const params = extractParams(ctx.match);
  console.log(params);
  if (params.task == "answer") {
    ctx.session.task = "answer";
    ctx.session.questionId = params.messageId;
    ctx.reply("Please enter your asnwer to the question");
  }
  if (params.task == "browse") {
    ctx.session.task == "browse";

    fetchAnswers(ctx, params.messageId);
  }
});
bot.command("about", async (ctx) => {
  console.log(ch);
  ctx.reply("about us info");
});

bot.command("help", (ctx) => {
  ctx.reply(" Help information ");
});

bot.command("ask", (ctx) => {
  ctx.reply("Please give me your question");
  ctx.session.task = "ask";
});

bot.on(":document", async (ctx) => {
  const { task, materialName, materialCategory, materialType } = ctx.session;
  if (task == "postMaterial") {
    if (materialName && materialCategory && materialType) {
      postMaterial(ctx);
    } else {
      ctx.reply("Please give us all required data to post a material ");
    }
  } else {
    ctx.reply(
      "Why did you sent a file.\n If you wanna share a material, use /materials"
    );
  }
});

bot.command("register", async (ctx) => {
  const userExists = await User.findOne({ tgId: ctx.chat.id });
  if (ctx.session.dbId) {
    return ctx.reply("You are already registered");
  } else if (userExists) {
    ctx.session.dbId = userExists.id;
    ctx.session.firstName = userExists.firstName;
    ctx.session.lastName = userExists.lastName;
    ctx.reply(" You are successfully authenticated. Enjoy and Learn! ");
  } else {
    ctx.session.task = "register";
    ctx.reply("send your first name");
  }
});

bot.command("materials", (ctx) => {
  ctx.reply("Choose please", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Get Materials",
            callback_data: "get_materials",
          },
        ],
        [
          {
            text: "Post Materials",
            callback_data: "post_material",
          },
        ],
      ],
    },
  });
});

// Question Post Stuff
bot.callbackQuery("confirm_post", async (ctx) => {
  ctx.deleteMessage();
  const { task, question } = ctx.session;
  if (task == "ask") {
    try {
      await postQuestion(ctx, question);
      ctx.reply("question posted ✅");
    } catch (error) {
      ctx.reply(error.message);
    }
  }

  if (task == "answer") {
    await postAnswer(ctx);
  }
});

bot.callbackQuery("cancel_post", (ctx) => {
  ctx.deleteMessage();
  ctx.session.task = null;
  ctx.session.question = null;
  ctx.session.anonymousMode = null;
  ctx.reply("question canceled ⛔️. \n send /ask to ask a question");
});

bot.on("callback_query", (ctx) => {
  ctx.deleteMessage();
  const { task } = ctx.session;
  const { data } = ctx.callbackQuery;

  // Anonymous mode on
  if (data == "anonymous_yes") {
    ctx.session.anonymousMode = true;
    confirmPostMessage(ctx);

    // Anonymous mode off
  } else if (data == "anonymous_no") {
    ctx.session.anonymousMode = false;
    confirmPostMessage(ctx);

    // Get materials button
  } else if (data == "get_materials") {
    ctx.session.task = "getMaterials";
    ctx.reply("tell me the subject of the material", {
      reply_markup: {
        inline_keyboard: subjectKeyboard,
      },
    });
  } else if (data == "post_material") {
    ctx.session.task = "postMaterial";
    ctx.reply("Please give me a descriptive name to the material");

    // Subjects Button
  } else if (subjects.filter((x) => x == data).length > 0) {
    ctx.session.materialCategory = data;
    ctx.reply("What kind of material do you want?", {
      reply_markup: {
        inline_keyboard: materialTypesKeyboard,
      },
    });
  } else if (types.filter((x) => x == data).length > 0) {
    ctx.session.materialType = data;
    fetchMaterials(ctx);
  } else {
    console.log("NOTHING");
  }
});
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  const {
    task,
    question,
    questionCategory,
    firstName,
    lastName,
    answer,
    materialName,
    materialCategory,
    materialType,
  } = ctx.session;
  if (task == "ask") {
    if (question) {
      if (!questionCategory) {
        ctx.session.questionCategory = text;
        ctx.reply(
          "Do you want to ask anonymously \n If you select 'No', your profile id will be attached to the question! ",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Yes",
                    callback_data: "anonymous_yes",
                  },
                  {
                    text: "No",
                    callback_data: "anonymous_no",
                  },
                ],
              ],
            },
          }
        );
      }
    } else {
      ctx.session.question = text;
      ctx.reply("What the subject matter of the question?", {
        reply_markup: {
          keyboard: [
            ["Math", "Physics", "Chemistery"],
            ["Biology", "History", "Civic"],
            ["English", "Amharic"],
          ],
        },
      });
    }
  } else if (task == "register") {
    if (firstName) {
      if (lastName) {
        if (text == "University") {
        } else {
          if (
            /[a-zA-Z]/.test(text) ||
            parseInt(text) > 12 ||
            parseInt(text) < 1
          ) {
            ctx.reply("Please use the buttons to enter your grade");
          } else {
            ctx.session.grade = parseInt(text);
            const user = {
              id: ctx.chat.id,
              username: ctx.chat.username,
              firstName: firstName,
              lastName: lastName,
              grade: parseInt(text),
            };
            await createUser(ctx, user);
          }
        }
      } else {
        ctx.session.lastName = text;
        ctx.reply("What grade are you in.", {
          reply_markup: gradeKeyboard,
        });
      }
    } else {
      ctx.session.firstName = text;
      ctx.reply("your last name please?");
    }
  } else if (task == "answer") {
    if (!answer) {
      ctx.session.answer = text;
      ctx.reply("Do want to asnwer anonymously?", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Yes",
                callback_data: "anonymous_yes",
              },
              {
                text: "No",
                callback_data: "anonymous_no",
              },
            ],
          ],
        },
      });
    }
    // post material
  } else if (task == "postMaterial") {
    if (materialName) {
      if (materialCategory) {
        if (!materialType) {
          ctx.session.materialType = text;
          ctx.reply("Finally, send me the material file");
        }
      } else {
        ctx.session.materialCategory = text;
        ctx.reply("Now please select the subject of the material", {
          reply_markup: {
            keyboard: [
              ["Note", "Presentationn", "Project"],
              ["Exam", "Worksheet", "Media"],
            ],
          },
        });
      }
    } else {
      ctx.session.materialName = text;
      ctx.reply("Now please select the subject of the material", {
        reply_markup: {
          keyboard: [
            ["Math", "Physics", "Chemistery"],
            ["Biology", "History", "Civic"],
            ["English", "Amharic"],
          ],
        },
      });
    }
  } else {
    ctx.reply(
      "Why did you send the text? I am not a chat bot \n To see what I am capable of  send /help "
    );
  }
});

export default webhookCallback(bot, "http");
