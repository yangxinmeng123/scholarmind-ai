
import React from 'react';

interface MarkdownViewProps {
  content: string;
}

// Helper to parse inline styles (Bold only for now to keep it clean)
const parseInline = (text: string) => {
  // Split by bold syntax **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let currentTable: string[] = [];
  let currentList: string[] = [];
  
  const renderTable = (tableLines: string[], key: number) => {
    // Filter out the separator line (e.g. |---|---|)
    const headerRow = tableLines[0];
    const bodyRows = tableLines.slice(2); // Skip header and separator
    
    const parseRow = (row: string) => {
        return row.split('|').map(c => c.trim()).filter(c => c !== '');
    };

    const headers = parseRow(headerRow);

    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="py-3 px-4 border-t-2 border-b border-stone-900 font-serif font-bold text-stone-900 bg-stone-50">
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, i) => {
               const cells = parseRow(row);
               const isLast = i === bodyRows.length - 1;
               return (
                 <tr key={i} className={isLast ? "border-b-2 border-stone-900" : "border-b border-stone-200"}>
                   {cells.map((c, ci) => (
                     <td key={ci} className="py-3 px-4 text-stone-700 align-top leading-relaxed">
                       {parseInline(c)}
                     </td>
                   ))}
                 </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderList = (items: string[], key: number) => {
    return (
      <ul key={key} className="my-4 space-y-2 list-disc list-outside ml-5 text-stone-700">
        {items.map((item, i) => (
          <li key={i} className="pl-1 leading-relaxed">
            {parseInline(item)}
          </li>
        ))}
      </ul>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    
    // 1. Handle Tables
    if (line.trim().startsWith('|')) {
      currentTable.push(line);
      // If next line is not a table, flush
      if (i === lines.length - 1 || !lines[i+1].trim().startsWith('|')) {
          blocks.push(renderTable(currentTable, i));
          currentTable = [];
      }
      continue;
    }

    // 2. Handle Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      currentList.push(line.trim().replace(/^[-*]\s/, ''));
      // If next line is not a list, flush
      if (i === lines.length - 1 || (!lines[i+1].trim().startsWith('- ') && !lines[i+1].trim().startsWith('* '))) {
        blocks.push(renderList(currentList, i));
        currentList = [];
      }
      continue;
    }

    // 3. Handle Headings
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4'; // Shift down one level for document flow
      
      const styles = {
        h2: "text-2xl font-serif font-bold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-200",
        h3: "text-xl font-serif font-bold text-stone-800 mt-6 mb-3",
        h4: "text-lg font-serif font-semibold text-stone-800 mt-4 mb-2"
      };

      blocks.push(
        React.createElement(Tag, { key: i, className: styles[Tag as keyof typeof styles] }, parseInline(text))
      );
      continue;
    }

    // 4. Handle Empty Lines
    if (line.trim() === '') {
      continue;
    }

    // 5. Handle Paragraphs
    blocks.push(
      <p key={i} className="mb-4 text-stone-700 leading-7 text-justify">
        {parseInline(line)}
      </p>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {blocks}
    </div>
  );
};

export default MarkdownView;
