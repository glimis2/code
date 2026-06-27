import { Box, Text } from "ink";
import React from "react";

interface Props {
    messages: ChatMessage[];
    streamingText?: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export function ChatView({ messages, streamingText }: Props) {
    return (
        <Box flexDirection="column" paddingLeft={1}>
            {messages.map((msg, i) => (
                <MessageBlock key={i} message={msg} />
            ))}
            {streamingText !== undefined && streamingText !== "" && (
                <Box>
                    <Text>
                        {streamingText} --
                    </Text>
                </Box>
            )}
        </Box>
    );
}


function MessageBlock({ message }: { message: ChatMessage }) {
    switch (message.role) {
        case "user":
            return (
                <Box marginBottom={0}>
                    <Text color="red">
                        {message.content}
                    </Text>
                </Box>
            );

        case "assistant":
            return (
                <Box marginBottom={0}>
                    <Text>{message.content}</Text>
                </Box>
            );


        default:
            return null;
    }
}
