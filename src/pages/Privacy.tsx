import Markdown from "react-markdown";

const content = `# Chính sách quyền riêng tư | Privacy Policy
*test123*
`;

export default function Privacy() {
  return (
    <div className="prose container p-10">
      <Markdown>{content}</Markdown>
    </div>
  );
}