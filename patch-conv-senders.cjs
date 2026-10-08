const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace(
  `        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.sender_id === user?.id} />
        ))}`,
  `        {messages.map((m) => {
          const senderMember = isGroup
            ? group?.members?.find((gm) => gm.user_id === m.sender_id)
            : null;
          const senderName = senderMember?.profile?.display_name || senderMember?.profile?.username;
          return (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.sender_id === user?.id}
              senderName={senderName}
              showSender={isGroup}
            />
          );
        })}`
);

fs.writeFileSync(p, s);
console.log("senders wired");
