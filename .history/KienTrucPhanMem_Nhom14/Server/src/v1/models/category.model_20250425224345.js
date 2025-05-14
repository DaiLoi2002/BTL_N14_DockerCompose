const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    parentSlug: {
      type: String,
      trim: true,
      default: null,
    },
    level: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

// Thêm index cho parent và level để tối ưu query
categorySchema.index({ parent: 1, level: 2 });

//categorySchema.index({ slug: 1 }, { unique: true });

categorySchema.index({ parentSlug: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
