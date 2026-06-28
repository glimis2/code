import React from "react";
import { Box, Text } from "ink";
import { useStreamStore } from "../store/streamStore";




export interface ChatMessage {
    type: "user" | "ai" | "tool";
    content: string;
    args?:any;
    id?:string;
    name?:string;
}



export function ChatView() {
    const { streamingText,  messages } = useStreamStore();
    

    return (
        <Box flexDirection="column" paddingLeft={1}>
            {messages.map((msg, i) => (
                <MessageBlock key={i} message={msg} />
            ))}

            {streamingText !== undefined && streamingText !== "" && (
                <Box>
                    <Text color="green">流式数据:</Text>
                    <Text color="green">
                        {streamingText}
                    </Text>
                </Box>
            )}
        </Box>
    );
}


function MessageBlock({ message }: { message: ChatMessage }) {
    switch (message.type) {
        case "user":
            return (
                <Box marginBottom={0}>
                    <Text color="red">
                        【user】:{message.content}
                    </Text>
                </Box>
            );

        case "ai":
            return (
                <Box marginBottom={0}>
                    <Text color="blue">【AI】:{message.content}</Text>
                </Box>
            );

        case "tool":
            return (
                <Box marginBottom={0}>
                    <Text color="white">【Tool】{message.name}:{message.args}</Text>
                </Box>
            );
        default:
            return null;
    }
}
