import Material from "../models/Material.js";
import { privateChannelId, resetState } from "./constants.js";
export const postMaterial = async (ctx) => {
  const post = await ctx.api.copyMessage(
    privateChannelId,
    ctx.chat.id,
    ctx.message.message_id,
    {
      caption: ctx.session.materialName,
    }
  );

  const newMaterial = new Material({
    name: ctx.session.materialName,
    category: ctx.session.materialCategory,
    sharedBy: ctx.session.dbId,
    messageId: post.message_id,
    type: ctx.session.materialType,
    datePosted: Date.now(),
  });
  await newMaterial.save();
  resetState(ctx);
  ctx.reply(
    "Your material was posted successfuly!! \n Thanks for contributing to our community🤩🤩🤩🤩"
  );
};

export const fetchMaterials = async (ctx) => {
  const { materialCategory, materialType } = ctx.session;

  const resultMaterials = await Material.find({
    category: materialCategory,
    type: materialType,
  });
  if (resultMaterials.length > 0) {
    resultMaterials.map((material) => {
      ctx.api.copyMessage(ctx.chat.id, privateChannelId, material.messageId);
    });
  } else {
    ctx.reply(
      "Sorry, We can't find any kind of material your are looking for!"
    );
  }

  resetState(ctx);
};
