"use client";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function LiveCode() {
  return (
    <section className="py-10">
      <h2 className="font-display text-3xl font-semibold mb-4">Interactive Example</h2>
      <div className="glass-card rounded-xl overflow-hidden">
        <Sandpack
          template="react"
          theme="dark"
          options={{
            showConsole: true,
            showTabs: true,
            showNavigator: true,
            recompileMode: "delayed",
          }}
          files={{
            "/App.js": {
              code: `import React from 'react';\nexport default function App(){\n  const [count,setCount]=React.useState(0);\n  return (<div style={{padding:20}}><h3>Framer-motion free counter</h3><button onClick={()=>setCount(c=>c+1)}>+1</button><p>Count: {count}</p></div>);\n}`,
            },
          }}
        />
      </div>
    </section>
  );
}