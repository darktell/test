import './App.css';
import {useQuery} from "react-query";
import { QueryClient, QueryClientProvider } from 'react-query';
import FormulaInput from "./components/Input";

const queryClient = new QueryClient();


function App() {

  return (
      <QueryClientProvider client={queryClient}>
        <div className="App flex flex-col items-center h-[100dvh] mt-10">
           <FormulaInput />
        </div>
      </QueryClientProvider>
  );
}

export default App;
