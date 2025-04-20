/*******************************************************************************
 * CLOUDERA APPLIED MACHINE LEARNING PROTOTYPE (AMP)
 * (C) Cloudera, Inc. 2024
 * All rights reserved.
 *
 * Applicable Open Source License: Apache 2.0
 *
 * NOTE: Cloudera open source products are modular software products
 * made up of hundreds of individual components, each of which was
 * individually copyrighted.  Each Cloudera open source product is a
 * collective work under U.S. Copyright Law. Your license to use the
 * collective work is as provided in your written agreement with
 * Cloudera.  Used apart from the collective work, this file is
 * licensed for your use pursuant to the open source license
 * identified above.
 *
 * This code is provided to you pursuant a written agreement with
 * (i) Cloudera, Inc. or (ii) a third-party authorized to distribute
 * this code. If you do not have a written agreement with Cloudera nor
 * with an authorized and properly licensed third party, you do not
 * have any rights to access nor to use this code.
 *
 * Absent a written agreement with Cloudera, Inc. (“Cloudera”) to the
 * contrary, A) CLOUDERA PROVIDES THIS CODE TO YOU WITHOUT WARRANTIES OF ANY
 * KIND; (B) CLOUDERA DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED
 * WARRANTIES WITH RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO
 * IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE; (C) CLOUDERA IS NOT LIABLE TO YOU,
 * AND WILL NOT DEFEND, INDEMNIFY, NOR HOLD YOU HARMLESS FOR ANY CLAIMS
 * ARISING FROM OR RELATED TO THE CODE; AND (D)WITH RESPECT TO YOUR EXERCISE
 * OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, CLOUDERA IS NOT LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR
 * CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, DAMAGES
 * RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF
 * BUSINESS ADVANTAGE OR UNAVAILABILITY, OR LOSS OR CORRUPTION OF
 * DATA.
 ******************************************************************************/

import { Divider, Flex, Typography } from "antd";
import SourceNodes from "pages/RagChatTab/ChatOutput/Sources/SourceNodes.tsx";
import PendingRagOutputSkeleton from "pages/RagChatTab/ChatOutput/Loaders/PendingRagOutputSkeleton.tsx";
import { ChatMessageType, isPlaceholder } from "src/api/chatApi.ts";
import { cdlBlue500, cdlGray200 } from "src/cuix/variables.ts";
import UserQuestion from "pages/RagChatTab/ChatOutput/ChatMessages/UserQuestion.tsx";
import { Evaluations } from "pages/RagChatTab/ChatOutput/ChatMessages/Evaluations.tsx";
import Images from "src/components/images/Images.ts";
import RatingFeedbackWrapper from "pages/RagChatTab/ChatOutput/ChatMessages/RatingFeedbackWrapper.tsx";
import Remark from "remark-gfm";
import Markdown from "react-markdown";
import { Button } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { PDFPage, PDFImage } from 'pdf-lib';
import customLogo from "src/components/images/headerTemplate.png";
import footerTemplate from "src/components/images/footerTemplate.png";

import "../tableMarkdown.css";

const ChatMessage = ({
  data,
  isLast,
}: {
  data: ChatMessageType;
  isLast: boolean;
}) => {
  if (isPlaceholder(data)) {
    return <PendingRagOutputSkeleton question={data.rag_message.user} />;
  }

  const renderMarkdownPdf = ({
    pdfDoc,
    fontRegular,
    fontBold,
    blocks,
    logoImage,
    margin = 50,
    fontSize = 12,
    lineHeight = 16,
  }: {
    pdfDoc: PDFDocument;
    fontSize?: number;
    logoImage: PDFImage;
    fontRegular: PDFFont;
    fontBold: PDFFont;
    lineHeight?: number;
    margin?: number;
    blocks:({type: string;content?: undefined;} | {type: string; content: string;})[];
  }) => {
    let page = pdfDoc.addPage([595, 842]);
    drawLogoOnPage(page, logoImage);
    const x = margin;
    let y = page.getHeight() - margin - 50; // Adjusted to fit the logo

    for (const block of blocks) {
      let blockFontSize = fontSize;
      let spacingBefore = 0;
      let spacingAfter = 0;
      let newpg = false;

      switch (block.type) {
        case 'heading3':
          blockFontSize = 18;
          spacingBefore = 30;
          spacingAfter = 10;
          break;
        case 'heading4':
          blockFontSize = 14;
          spacingBefore = 20;
          spacingAfter = 8;
          break;
        case 'bullet':
          spacingBefore = 6;
          spacingAfter = 6;
          break;
        case 'paragraph':
          spacingBefore = 10;
          spacingAfter = 15;
          break;
        case 'hr':
          spacingBefore = 20;
          spacingAfter = 20;
          break;
      }

      y -= spacingBefore;

      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([595, 842]);
        y = page.getHeight() - margin - 70; // Reset y position
        drawLogoOnPage(page, logoImage); // Add logo again
        newpg = true;
      }

      if (block.type === 'hr' && !newpg) {
        page.drawLine({
          start: { x: x, y },
          end: { x: page.getWidth() - margin, y },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
      } else if (block.type === 'bullet') {
        newpg = false;
        const bulletWidth = fontRegular.widthOfTextAtSize('• ', fontSize);
        page.drawText('•', {
          x,
          y,
          size: fontSize,
          font: fontRegular,
        });

        ({ page, y } = drawWrappedMarkdownLine({
          pdfDoc,
          page,
          text: block.content,
          x: x + bulletWidth,
          y,
          maxWidth: page.getWidth() - margin * 2 - bulletWidth,
          fontSize,
          fontRegular,
          fontBold,
          lineHeight,
        }));
      } else {
        newpg = false;
        const isHeading = block.type === 'heading3' || block.type === 'heading4';
        const font = isHeading ? fontBold : fontRegular;

        ({ page, y } = drawWrappedMarkdownLine({
          pdfDoc,
          page,
          text: block.content,
          x,
          y,
          maxWidth: page.getWidth() - margin * 2,
          fontSize: blockFontSize,
          fontRegular: font,
          fontBold: font,
          lineHeight,
        }));
      }

      y -= spacingAfter;
    }

    return pdfDoc;
  }
  const drawWrappedMarkdownLine = ({
    pdfDoc,
    page,
    text,
    x,
    y,
    maxWidth,
    fontSize,
    fontRegular,
    fontBold,
    lineHeight,
  } : {
    pdfDoc: PDFDocument;
    page: PDFPage;
    text: string | undefined;
    x: number;
    y: number;
    maxWidth: number;
    fontSize: number;
    fontRegular: PDFFont;
    fontBold: PDFFont;
    lineHeight: number;
  }) => {
    const words : {text: string , bold: boolean}[] = [];
    const parts = text?.split(/(\*\*.*?\*\*)/g);

    if (!parts) return { page, y };
    for (const part of parts) {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const clean = isBold ? part.slice(2, -2) : part;
      clean.split(' ').forEach((word, index) => {
        if (word.trim()) {
          words.push({ text: word, bold: isBold });
        }
        if (index < clean.split(' ').length - 1) {
          words.push({ text: ' ', bold: isBold });
        }
      });
    }
  
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const margin = 50;
    let currentX = x;
    let currentY = y;
  
    for (const word of words) {
      const font = word.bold ? fontBold : fontRegular;
      const width = font.widthOfTextAtSize(word.text, fontSize);
  
      if (currentX + width > x + maxWidth) {
        currentY -= lineHeight;
        currentX = x;
      }
  
      if (currentY < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
        currentX = x;
      }
  
      page.drawText(word.text, {
        x: currentX,
        y: currentY,
        size: fontSize,
        font,
      });
  
      currentX += width;
    }
  
    return { page, y: currentY };
  };

  const parseMarkdown = (md : string)  => {
    const lines = md.split('\n');
    lines.unshift("Date : " + new Date().toLocaleDateString("en-US"));
    lines.unshift("");

    const blocks = [];

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('---')) {
        blocks.push({ type: 'hr' });
      } else if (line.startsWith('### ')) {
        blocks.push({ type: 'heading3', content: line.slice(4).trim() });
      } else if (line.startsWith('#### ')) {
        blocks.push({ type: 'heading4', content: line.slice(5).trim() });
      } else if (line.startsWith('- ')) {
        blocks.push({ type: 'bullet', content: line.slice(2).trim() });
      } else {
        blocks.push({ type: 'paragraph', content: line.trim() });
      }
    }

    return blocks;
  }

  const downloadContainer = () => {
    handleDownload()
      .then( (pdfBytes) => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'response.pdf';
        link.click();
      }).catch((error : unknown) => {
        console.error("Error downloading PDF: ", error)
      });
  }
  
  const drawLogoOnPage = ( page:PDFPage , logoImage: PDFImage) => {
    
    const logoDims = logoImage.scale(0.25); // adjust scale as needed
    page.drawImage(logoImage, {
      x: page.getWidth() - logoDims.width - 240, // 40px from right
      y: page.getHeight() - logoDims.height - 30, // 30px from top
      width: logoDims.width,
      height: logoDims.height,
    });
    const x = 50;
    const y = page.getHeight() - 70;
    page.drawLine({
      start: { x: x, y },
      end: { x: page.getWidth() - 50, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  const handleDownload = async () => {
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const response = await fetch(customLogo);
    const logoBytes = await response.arrayBuffer();
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const responseFooter = await fetch(footerTemplate);
    const footerBytes = await responseFooter.arrayBuffer();
    const footerImage = await pdfDoc.embedPng(footerBytes);
    const blocks = parseMarkdown(data.rag_message.assistant);

    renderMarkdownPdf({
      pdfDoc,
      blocks,
      fontRegular,
      fontBold,
      logoImage,
    });

    const footerMargin = 40;
    const footerDims = logoImage.scale(1)
    pdfDoc.getPages().forEach((page) => {
      //const pageWidth = page.getWidth();

      page.drawImage(footerImage, {
        x: footerMargin,
        y: 0,
        width: footerDims.width,
        height: footerDims.height,
      });
    });

    return await pdfDoc.save();
  };

  return (
    <div data-testid="chat-message">
      {data.rag_message.user ? (
        <div>
          <UserQuestion question={data.rag_message.user} />
          <Flex
            style={{ marginTop: 15 }}
            align="baseline"
            justify="space-between"
            gap={8}
          >
            <div style={{ flex: 1 }}>
              {data.source_nodes.length > 0 ? (
                <Images.AiAssistantWhite
                  style={{
                    padding: 4,
                    backgroundColor: cdlBlue500,
                    borderRadius: 20,
                    width: 24,
                    height: 24,
                    flex: 1,
                  }}
                />
              ) : (
                <Images.Models
                  style={{
                    padding: 4,
                    backgroundColor: cdlGray200,
                    borderRadius: 20,
                    width: 26,
                    height: 24,
                    flex: 1,
                  }}
                />
              )}
            </div>
            <Flex vertical gap={8} style={{ width: "100%" }}>
              <SourceNodes data={data} />
              <Typography.Text style={{ fontSize: 16, marginTop: 8 }}>
                <Markdown
                  skipHtml
                  remarkPlugins={[Remark]}
                  className="styled-markdown"
                >
                  {data.rag_message.assistant.trimStart()}
                </Markdown>
              </Typography.Text>
              <Button icon={<PaperClipOutlined />} onClick={downloadContainer}>Download Response <b>(PDF)</b></Button>
              <Flex gap={16} align="center">
                <Evaluations evaluations={data.evaluations} />
                <RatingFeedbackWrapper responseId={data.id} />
              </Flex>
            </Flex>
          </Flex>
        </div>
      ) : null}
      {isLast ? null : <Divider />}
    </div>
  );
};

export default ChatMessage;
