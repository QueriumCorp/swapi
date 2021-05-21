const bodySchema = {
  type: "object",
  required: ["id", "class", "definition"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    stimulus: { type: "string" },
    class: {
      type: "string",
      enum: ["gradeBasicAlgebra", "gradeBasicCalculus"],
    },
    definition: { type: "string", minLength: 5 },
    hints: { type: "array", maxItems: 3, items: { type: "string" } },
  },
};

module.exports = {
  bodySchema,
};
