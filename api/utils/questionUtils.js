import Question from "../models/Question.js";
import { channelID, botId } from "./constants.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
export const postQuestion = async (ctx, question) => {
  const channel = await ctx.api.getChat(channelID);

  const { questionCategory, anonymousMode } = ctx.session;

  const post = await ctx.api.sendMessage(channel.id, question);

  const newUrl = (task) => {
    return `https://t.me/${botId.substring(1)}?start=${btoa(
      `messageId=${post.message_id}&task=${task}`
    )}`.replace(/\s+/g, "");
  };

  // the new URL you want to set
  // update the message with the modified keyboard
  console.log("We are here");
  await ctx.api.editMessageReplyMarkup(channel.id, post.message_id, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Answer",
            url: newUrl("answer"),
          },
          {
            text: "Browse",
            url: newUrl("browse"),
          },
        ],
      ],
    },
  });
  const newQuestion = new Question({
    text: question,
    category: questionCategory,
    asker: new ObjectId(ctx.session.dbId),
    isAnonymous: anonymousMode,
    tgId: post.message_id,
  });

  await newQuestion.save();
  ctx.session.task = null;
  ctx.session.question = null;
  ctx.session.questionCatergory = null;
  ctx.session.anonymousMode = null;
};

export const confirmPost = async (ctx) => {
  await ctx.reply(`Confirm your task?  `, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Yes",
            callback_data: "confirm_post",
          },
          {
            text: "No",
            callback_data: "cancel_post",
          },
        ],
      ],
    },
  });
};

export const extractParams = (base64) => {
  let decoded = atob(base64);
  return Object.fromEntries(new URLSearchParams(decoded));
};
