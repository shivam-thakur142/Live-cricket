import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { TeamLogo } from "./TeamLogo";
import { getTeamById } from "@/utils/helpers";
import type { PointsTableEntry } from "@/types";

interface PointsTableViewProps {
  entries: PointsTableEntry[];
  compact?: boolean;
}

export function PointsTableView({ entries, compact }: PointsTableViewProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell header>Pos</TableCell>
          <TableCell header>Team</TableCell>
          {!compact && <TableCell header>P</TableCell>}
          <TableCell header>W</TableCell>
          <TableCell header>L</TableCell>
          {!compact && <TableCell header>NR</TableCell>}
          <TableCell header>Pts</TableCell>
          <TableCell header>NRR</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map((entry) => {
          const team = getTeamById(entry.teamId);
          return (
            <TableRow key={entry.teamId}>
              <TableCell className="pos-cell">{entry.position}</TableCell>
              <TableCell>
                <div className="table-team">
                  <TeamLogo name={team?.name ?? ""} size={32} />
                  <span>{team?.shortName ?? team?.name}</span>
                </div>
              </TableCell>
              {!compact && <TableCell>{entry.played}</TableCell>}
              <TableCell>{entry.won}</TableCell>
              <TableCell>{entry.lost}</TableCell>
              {!compact && <TableCell>{entry.nr}</TableCell>}
              <TableCell className="points-cell">{entry.points}</TableCell>
              <TableCell>{entry.nrr.toFixed(3)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
