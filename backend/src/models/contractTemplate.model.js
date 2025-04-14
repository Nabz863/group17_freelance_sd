// This file defines the structure for contract templates
// Will be implemented with actual database once set up

const defaultContractTemplate = {
    title: "Standard Freelance Contract",
    sections: [
      {
        title: "Scope of Work",
        content: "The Freelancer agrees to provide the following services to the Client...",
        editable: false
      },
      {
        title: "Timeline",
        content: "The work will be completed according to the following schedule...",
        editable: true,
        parameters: {
          startDate: {
            type: "date",
            required: true
          },
          endDate: {
            type: "date",
            required: true,
            validation: "after:startDate"
          }
        }
      },
      {
        title: "Payment Terms",
        content: "Payment will be made according to the following structure...",
        editable: true,
        parameters: {
          paymentStructure: {
            type: "select",
            options: ["Hourly", "Fixed", "Milestone-based"],
            required: true
          },
          rate: {
            type: "number",
            required: true,
            min: 1
          },
          currency: {
            type: "select",
            options: ["USD", "EUR", "GBP"],
            default: "USD"
          },
          paymentSchedule: {
            type: "select",
            options: ["Weekly", "Bi-weekly", "Monthly", "Upon completion", "Custom"],
            default: "Upon completion"
          }
        }
      },
      {
        title: "Revisions",
        content: "The Freelancer agrees to provide revisions as follows...",
        editable: true,
        parameters: {
          revisionLimit: {
            type: "number",
            required: true,
            default: 2,
            min: 0,
            max: 10
          },
          revisionPeriod: {
            type: "number",
            required: true,
            default: 7,
            min: 1,
            max: 30,
            description: "Days allowed for revision requests"
          }
        }
      },
      {
        title: "Intellectual Property",
        content: "All intellectual property rights in the work will...",
        editable: false
      },
      {
        title: "Confidentiality",
        content: "Both parties agree to maintain the confidentiality of...",
        editable: false
      },
      {
        title: "Termination",
        content: "This contract may be terminated under the following conditions...",
        editable: true,
        parameters: {
          noticePeriod: {
            type: "number",
            required: true,
            default: 14,
            min: 1,
            max: 60,
            description: "Days of notice required for termination"
          }
        }
      }
    ]
  };
  
  // In-memory storage for contract templates (will be replaced with database)
  const contractTemplates = [defaultContractTemplate];
  
  module.exports = {
    defaultContractTemplate,
    contractTemplates
  };