
import { format } from "date-fns";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";


import { CategotyTooltip } from "./category-tooltip";
import { formatPercentage } from "@/lib/utils";

const COLORS = [ "#0062ff", "#12c6ff", "#ff647f", "#ff9354",]

type Props = {
	data?: {
		name: string;
		value: number;
	}[];
};

export const PieVariant = ({ data }: Props) => {
    // Ensure data is always an array
    const pieData = data ?? [];
    console.log('PieVariant pieData:', pieData);
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="right"
                    iconType="circle"
                    content={({ payload }: any) => {
                        return (
                            <ul className="flex flex-col space-y-2">
                                {payload.map((entry: any, index: number) => {
                                    // Find the matching data item by name
                                    const dataItem = pieData.find((d) => d.name === entry.value);
                                    const percent = dataItem && total > 0 ? (dataItem.value / total) * 100 : 0;
                                    return (
                                        <li key={`item-${index}`} className="flex items-center space-x-2">
                                            <span
                                                className="size-2 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <div className="space-x-1">
                                                <span className="text-sm text-muted-foreground">{entry.value}</span>
                                                <span className="text-sm">{formatPercentage(percent)}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    }}
                />
                <Tooltip 
                    content={<CategotyTooltip />}
                />
                <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    fill="#8884d8"
                    labelLine={false}
                >
                    {pieData.map((_entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}

