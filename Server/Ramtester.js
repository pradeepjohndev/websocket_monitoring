
export default function Memo() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);

  const calculatedValue = useMemo(() => {
    return slowFunction(count);
  }, [count]);
  
  const themeStyles = {
    backgroundColor: dark ? "black" : "white",
    color: dark ? "white" : "black",
    padding: "20px",
    marginTop: "20px"
  };

  return (
    <>
      <h1>Count: {count}</h1>
      <h2>Calculated Value: {calculatedValue}</h2>

      <button onClick={() => setCount(count + 1)}>Increase Count</button>
      <button onClick={() => setDark(!dark)}>Toggle Theme</button>

      <div style={themeStyles}>
        Theme: {dark ? "Dark" : "Light"}
      </div>
    </>
  );
}
