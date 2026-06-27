import { Box, Text } from "ink";
import React from "react";

interface Props {
  
    streamingText?: string;
}



export function ChatView({  streamingText }: Props) {
    return (
        <Box flexDirection="column" paddingLeft={1}>
     
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


