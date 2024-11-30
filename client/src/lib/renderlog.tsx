export const renderLog = (log: string) => {
  
    return log
      .replace(/^\n|\n$/g, "")
      .replace(/\|/g, ",")
      .split("\n")
      .map((line, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {line}
        </p>
      ));
  };