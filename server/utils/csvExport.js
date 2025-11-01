const { Parser } = require("json2csv");

exports.generateApplicantsCSV = (applicants) => {
    try {
        const fields = [
            { label: "Name", value: "name" },
            { label: "Email", value: "email" },
            { label: "Phone", value: "phone" },
            { label: "Experience (Years)", value: "experience" },
            { label: "Education", value: "education" },
            { label: "Applied At", value: "createdAt" }
        ];

        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(applicants);

        return csv;
    } catch (err) {
        console.error("CSV generation error:", err);
        throw new Error("Failed to generate CSV");
    }
};
