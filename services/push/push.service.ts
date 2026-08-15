export const pushMessageToUser = async (userId: string, message: string) => {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.LINE_CHANNEL_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    };

    const response = await fetch(
      "https://api.line.me/v2/bot/message/push",
      requestOptions,
    );
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Network or parsing error:", error);
  }
};
