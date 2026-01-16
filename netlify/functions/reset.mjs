import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

let email =""

router.post("/forgot", async (req, res) => {
   email  = req.body.email;
})

export const handler = async (event, context) => {
  console.log(email)
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // const formData = JSON.parse(event.body);
    // const { to, subject, message } = formData;
    const from = process.env.SEND_EMAIL_FROM; // Use the verified domain email

    const { data, error } = await resend.emails.send({
      from: from,
      to: email,
      subject: subject,
      html: <h1>Reset</h1>
    });

    if (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Email failed to send",
          error: error.message,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully", data: data }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
      }),
    };
  }
};
