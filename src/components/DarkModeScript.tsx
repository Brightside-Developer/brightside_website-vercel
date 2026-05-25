export default function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var mode = localStorage.getItem('darkMode');
              if (mode === 'true') {
                document.documentElement.classList.add('dark');
              } else if (mode === 'false') {
                document.documentElement.classList.remove('dark');
              } else {
                // If no preference stored, default to light mode
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
