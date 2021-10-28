import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Loader } from "@progress/kendo-react-indicators";
import '@progress/kendo-theme-default/dist/all.css';
import { useEffect, useState } from "react";
import socketClient from "socket.io-client";
import LoginBox from "./LoginBox";
import PlayerActions from "./PlayerActions";

const SOCKET_SERVER = process.env.SOCKET_SERVER ?? "ws://localhost:3001";

const App = () => {
  const [playerId, setStoragePlayerId] = useState(localStorage.getItem('playerId'));

  const [leaders, setLeaders] = useState([]);
  const [players, setPlayers] = useState([]);

  const [isLoad, setIsLoad] = useState(false);

  const socket = socketClient(SOCKET_SERVER);

  useEffect(() => {

    if (playerId && playerId !== null && playerId !== "") {

      socket.on('connection', () => console.log(`I'm connected with the back-end`));

      socket.on('leaders', (leadersData) => {
        socket.emit('playerRank', playerId);
        setLeaders(leadersData);
        setIsLoad(true);
      });

      socket.on(`playerRank:${playerId}`, (playersData) => {
        setPlayers(playersData);
      });
    } else {
      setIsLoad(true);
    }

    return () => socket.disconnect();

  }, [playerId]);


  if (!isLoad) {
    return <div className="spinner">
      <Loader type="converging-spinner" />
    </div>
  }

  if (!playerId) {
    return <LoginBox setStoragePlayerId={setStoragePlayerId} />;
  }

  return (
    <>
      <Grid
        className="table"
        scrollable="scrollable"
        data={[...leaders, ...[{}], ...players]}
      >
        <GridColumn field="rank" title="Rank" />
        <GridColumn field="_id" title="User ID" cell={(field) => {
          return <CellPlayerId items={[...leaders, ...[{}], ...players]} index={field.dataIndex} currentPlayerId={playerId} />
        }} />
        <GridColumn field="username" title="Username" />
        <GridColumn field="country" title="Country" />
        <GridColumn field="money" title="Money" cell={(field) => {
          return <CellMoney items={[...leaders, ...[{}], ...players]} index={field.dataIndex} />
        }} />
        <GridColumn field="score" title="Score" />
        <GridColumn field="dailyDiff" title="Daily Diff" cell={(field) => {
          return <CellDailyDiff items={[...leaders, ...[{}], ...players]} index={field.dataIndex} />
        }} />
      </Grid>

      <PlayerActions socket={socket} playerId={playerId} setStoragePlayerId={setStoragePlayerId} />
    </>
  );
};

const CellPlayerId = ({ items, index, currentPlayerId }) => {
  const item = items[index];
  if (!item) return <td></td>;
  if (item._id === currentPlayerId)
    return <td><b>{item._id}</b></td>
  return <td>{item._id}</td>
}


const CellMoney = ({ items, index }) => {
  let item = items[index];
  if (!item || !item.money) return <td></td>;
  return <td>{item.money.toFixed(5)}</td>
}

const CellDailyDiff = ({ items, index }) => {
  const item = items[index];
  if (!item) return <td></td>;
  let color = "rgb(230 230 162 / 70%)";
  if (item.dailyDiff > 0) {
    color = "rgb(94 214 94 / 70%)";
  } else if (item.dailyDiff < 0) {
    color = "rgb(236 109 109 / 70%)";
  }
  return <td style={{ backgroundColor: color }}>{item.dailyDiff}</td>;
}

export default App;
