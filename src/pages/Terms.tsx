import Markdown from "react-markdown";

const content = `# Điều khoản dịch vụ | Terms of Service
*test123*
`;

export default function Terms() {
  return (
    <div className="prose container p-10">
      <Markdown>{content}</Markdown>
    </div>
  );
}
