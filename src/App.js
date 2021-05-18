import './assets/app.scss';
import {Box} from "@material-ui/core";
import TradingView from "./components/TradingView"

const App = () => {
  return (
    <Box className="app">
      <TradingView />
    </Box>
  );
}

export default App;
