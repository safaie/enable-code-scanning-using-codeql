const yaml = require("js-yaml");
const fs = require("fs");

module.exports = async () => {
  const { GITHUB_WORKSPACE } = process.env;
  // read a file from the workspace
  const file = fs.readFileSync(
    `${GITHUB_WORKSPACE}/.github/workflows/codeql-analysis.yml`,
    "utf8"
  );

  // parse the file with js-yaml
  const workflowData = yaml.load(file);

  const {
    jobs: {
      analyze: { steps },
    },
  } = workflowData;

  const hasCheckoutRepository = steps.some((step) =>
    step.uses.includes("actions/checkout")
  );
  const hasInitializeCodeQL = steps.some((step) =>
    step.uses.includes("codeql-action/init")
  );
  const hasPerformAnalysis = steps.some((step) =>
    step.uses.includes("codeql-action/analyze")
  );

  try {
    //   Do some logic to verify the leaner understands
    if (hasCheckoutRepository && hasInitializeCodeQL && hasPerformAnalysis) {
      return {
        reports: [
          {
            filename: `${GITHUB_WORKSPACE}/codeql-analysis.yml`,
            isCorrect: true,
            display_type: "actions",
            level: "info",
            msg: "Great job!",
            error: {
              expected: "",
              got: "",
            },
          },
        ],
      };
      // BAD-RESULT
    } else {
      return {
        reports: [
          {
            filename: `${GITHUB_WORKSPACE}/codeql-analysis.yml`,
            isCorrect: false,
            display_type: "actions",
            level: "warning",
            msg: `incorrect solution`,
            error: {
              expected:
                "We expected your workflow contain a valid Repository Checkout Step, CodeQL Initalization Step and CodeQL Analyze Step.  Ensure the actions you are using in your worklow are accurately referenced!",
              got: `\n${
                hasCheckoutRepository
                  ? "Correct Checkout action"
                  : "Missing valid Checkout action in workflow"
              }\n${
                hasInitializeCodeQL
                  ? "Correct CodeQL Initalization action"
                  : "Missing valid CodeQL Initialization action in workflow"
              }\n${
                hasPerformAnalysis
                  ? "Correct CodeQL Analyze action"
                  : "Missing valid CodeQL Analyze action in workflow"
              }`,
            },
          },
        ],
      };
    }
  } catch (error) {
    return {
      reports: [
        {
          filename: `${GITHUB_WORKSPACE}/codeql-analysis.yml`,
          isCorrect: false,
          display_type: "actions",
          level: "fatal",
          msg: "",
          error: {
            expected: "",
            got: "An internal error occurred.  Please open an issue at: https://github.com/githubtraining/exercise-enable-code-scanning-using-codeql and let us know!  Thank you",
          },
        },
      ],
    };
  }
};
