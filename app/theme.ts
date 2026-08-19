import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff492e", contrastText: "#180c09" },
    secondary: { main: "#ffad42" },
    background: { default: "#100d0d", paper: "#1c1414" },
    text: { primary: "#fff5eb", secondary: "#b7aaa3" },
    error: { main: "#ff735f" },
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: { fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: "-0.05em", lineHeight: 0.85 },
    button: { fontWeight: 900, letterSpacing: "0.08em" },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 3 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
