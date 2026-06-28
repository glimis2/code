import { Box, Text } from "ink";
import React from "react";

export interface ToolItem {
    event: string;
    tool: string;
    input: any;
    toolCallId: string;
    status?: string;
    timestamp?: number;
    completeTimestamp?: number;
    argsDelta?: string;
    index?: number;
}

interface Props {
    tools: ToolItem[];
    collapsed?: boolean;
}

const STATUS_ICONS: Record<string, string> = {
    calling: "⏳",
    streaming: "🔄",
    complete: "✅",
    error: "❌",
};

function getStatusIcon(tool: ToolItem): string {
    if (tool.event === "tool_call_chunk" && tool.status !== "complete") return STATUS_ICONS.streaming;
    return STATUS_ICONS[tool.status || "calling"] || "🔧";
}

function formatTimestamp(ts?: number): string {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour12: false });
}

export function ToolMessage({ tools, collapsed = false }: Props) {
    if (tools.length === 0) return null;

    return (
        <Box flexDirection="column" marginTop={1} paddingLeft={1}>
            <Text color="yellow" bold>
                {"\u2500"} Tool Calls ({tools.length}) {"\u2500".repeat(Math.max(0, 20))}
            </Text>

            {tools.map((tool, i) => (
                <Box key={tool.toolCallId || i} flexDirection="column" marginTop={i > 0 ? 0 : 0}>
                    <Box>
                        <Text>{getStatusIcon(tool)}</Text>
                        <Text color="cyan" bold> {tool.tool || "(pending)"}</Text>
                        <Text color="gray"> [{tool.toolCallId}]</Text>
                        {tool.event === "tool_call_chunk" && tool.status !== "complete" && (
                            <Text color="yellow"> streaming</Text>
                        )}
                        {tool.timestamp && (
                            <Text color="gray"> {formatTimestamp(tool.timestamp)}</Text>
                        )}
                    </Box>

                    {!collapsed && tool.input && (
                        <Box paddingLeft={2}>
                            <Text color="gray">Input: </Text>
                            <Text color="white">{JSON.stringify(tool.input, null, 2)}</Text>
                        </Box>
                    )}

                    {tool.status === "complete" && (
                        <Box paddingLeft={2}>
                            <Text color="green">Completed</Text>
                            {tool.completeTimestamp && (
                                <Text color="gray"> {formatTimestamp(tool.completeTimestamp)}</Text>
                            )}
                        </Box>
                    )}
                </Box>
            ))}

            <Text color="yellow" bold>
                {"\u2500".repeat(30)}
            </Text>
        </Box>
    );
}
