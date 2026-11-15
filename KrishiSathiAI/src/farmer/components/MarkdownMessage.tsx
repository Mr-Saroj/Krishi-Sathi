
import React from 'react';
import { View, useWindowDimensions, ScrollView } from 'react-native';
import Markdown from "@ronradtke/react-native-markdown-display";

interface Props {
  content: string;
}

const MarkdownMessage: React.FC<Props> = ({ content }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width: '100%' }}>
      <Markdown
        style={{
          body: {
            color: '#26352B',
            fontSize: 15,
            lineHeight: 24,
          },
          heading1: {
            color: '#14532D',
            fontSize: 22,
            fontWeight: '700',
            marginTop: 12,
            marginBottom: 8,
          },
          heading2: {
            color: '#14532D',
            fontSize: 19,
            fontWeight: '700',
            marginTop: 12,
            marginBottom: 8,
          },
          heading3: {
            color: '#2E7D32',
            fontSize: 16,
            fontWeight: '700',
            marginTop: 10,
            marginBottom: 6,
          },
          paragraph: {
            marginTop: 3,
            marginBottom: 10,
          },
          strong: {
            color: '#14532D',
            fontWeight: '700',
          },
          bullet_list: {
            marginBottom: 10,
          },
          ordered_list: {
            marginBottom: 10,
          },
          list_item: {
            marginBottom: 5,
          },
          blockquote: {
            backgroundColor: '#EEF3EC',
            borderLeftColor: '#2E7D32',
            borderLeftWidth: 4,
            paddingHorizontal: 10,
            paddingVertical: 5,
          },
          code_inline: {
            backgroundColor: '#EEF3EC',
            color: '#14532D',
          },
          fence: {
            backgroundColor: '#F1F5F1',
            padding: 12,
            borderRadius: 8,
          },
          table: {
            borderWidth: 1,
            borderColor: '#DCE6DE',
            marginVertical: 10,
          },
          th: {
            backgroundColor: '#EEF3EC',
            padding: 8,
            fontWeight: '700',
            color: '#14532D',
          },
          td: {
            padding: 8,
            borderWidth: 1,
            borderColor: '#DCE6DE',
          },
          link: {
            color: '#2E7D32',
            textDecorationLine: 'underline',
          },
          hr: {
            backgroundColor: '#DCE6DE',
            height: 1,
            marginVertical: 10,
          },
        }}
      >
        {content}
      </Markdown>
    </View>
  );
};

export default MarkdownMessage;
