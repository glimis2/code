import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useModelStore } from "../store/modelStore";
import { setCurrentModelName } from "../config";

interface ModelPickerProps {
  models: { name: string; provider: string }[];
  currentModel: string;
  onSelect: (modelName: string) => void;
  onClose: () => void;
}

export function ModelPicker({ models, currentModel, onSelect, onClose }: ModelPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const safeIndex = Math.min(selectedIndex, Math.max(0, models.length - 1));

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(models.length - 1, prev + 1));
    } else if (key.return) {
      const selected = models[safeIndex];
      if (selected) {
        setCurrentModelName(selected.name);
        useModelStore.getState().setCurrentModel(selected.name);
        onSelect(selected.name);
      }
      onClose();
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} marginTop={1}>
      <Text color="gray" bold>选择模型 (↑↓ 选择, Enter 确认)</Text>
      <Text color="gray">当前: {currentModel}</Text>
      {models.map((model, index) => (
        <Box
          key={model.name}
          flexDirection="row"
          alignItems="center"
          width="100%"
        >
          <Box width={25} flexShrink={0}>
            {index === safeIndex ? (
              <Text color="green">{">"} </Text>
            ) : (
              <Text>{"  "}</Text>
            )}
            <Text color={index === safeIndex ? "green" : undefined} bold={index === safeIndex}>
              {model.name}
            </Text>
          </Box>
          <Box flexShrink={1}>
            <Text color="gray" wrap="truncate-end">
              ({model.provider})
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
