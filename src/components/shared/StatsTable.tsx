import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { getPlayerById, getTeamById } from "@/utils/helpers";
import { TeamLogo } from "./TeamLogo";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => string | number;
}

interface StatsTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getPlayerId: (row: T) => string;
}

export function StatsTable<T>({ data, columns, getPlayerId }: StatsTableProps<T>) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Rank</TableCell>
          <TableCell header>Player</TableCell>
          <TableCell header>Team</TableCell>
          {columns.map((col) => (
            <TableCell header key={col.key}>
              {col.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, idx) => {
          const player = getPlayerById(getPlayerId(row));
          const team = player ? getTeamById(player.teamId) : undefined;
          return (
            <TableRow key={idx}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{player?.name ?? "Unknown"}</TableCell>
              <TableCell>
                <div className="table-team">
                  <TeamLogo name={team?.name ?? ""} size={28} />
                  <span>{team?.shortName ?? team?.name}</span>
                </div>
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.render(row)}</TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
