import { regions } from "../config/const";
import { ContractType, TimeDemand } from "../models/jobPosition.model";

export const getRegionName = (region: number) => {
    const regionName = regions.find((reg) => reg.id === region);
    return regionName?.name ?? "Neznámy region";
};

export const getContractName = (contractType: ContractType): string => {
    switch (contractType) {
        case ContractType.HPP:
            return "Hlavný pracovný pomer";
        case ContractType.SALARY_HELP:
            return "Práca na dohodu";
        case ContractType.UNPAID_HELP:
            return "Práca na dohodu bez nároku na odmenu";
        default:
            return "Neznámy typ zmluvy";
    }
};

export const getTimeDemandName = (timeDemand: TimeDemand): string => {
    switch (timeDemand) {
        case TimeDemand.FREE:
            return "Volný pracovný čas";
        case TimeDemand.REGULAR:
            return "Pravidelný pracovný čas";
        case TimeDemand.IRREGULAR:
            return "Nepravidelný pracovný čas";
        default:
            return "Neznámy časový nárok";
    }
};
