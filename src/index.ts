import { AppDataSource } from "./data-source";
import { IDKPIRepository, AlertRepository } from "./data-source";
import { Alert, AlertTypes } from "./entity/Alert";
import { format, subDays } from "date-fns";
import { MoreThan, Not, In } from "typeorm";
import { schedule } from "node-cron";

const getAlertType = (
  value: number,
  min: number,
  max: number
): AlertTypes | null => {
  // if value exceeds 10% of max or is below 10% of min, return MINOR
  if (value > max * 1.1 || value < min * 0.9) {
    return AlertTypes.MINOR;
  }
  // if value exceeds 20% of max or is below 20% of min, return MAJOR
  if (value > max * 1.2 || value < min * 0.8) {
    return AlertTypes.MAJOR;
  }
  // if value exceeds 30% of max or is below 30% of min, return CRITICAL
  if (value > max * 1.3 || value < min * 0.7) {
    return AlertTypes.CRITICAL;
  }

  return null;
};
const cronJob = async () => {
  const now = new Date();
  const minDate = subDays(now, 40);
  const timeOfDay = format(now, "HH");

  const latest3Entries = await IDKPIRepository.find({
    order: {
      timestamp: "DESC",
    },
    take: 3,
  });

  const idkpis = await IDKPIRepository.find({
    where: {
      timestamp: MoreThan(minDate),
      isTrusted: true,
      id: Not(In(latest3Entries.map((e) => e.id))),
    },
  });

  const filteredIDKPIs = idkpis.filter((idkpi) => {
    const idkpiTimeOfDay = format(idkpi.timestamp, "HH");
    return idkpiTimeOfDay === timeOfDay;
  });

  const groupMinAndMaxValuesByType = filteredIDKPIs.reduce(
    (acc, idkpi) => {
      const { type, value } = idkpi;
      const min = acc[type].min;
      const max = acc[type].max;
      if (value < min) {
        acc[type].min = value;
      }
      if (value > max) {
        acc[type].max = value;
      }
      return acc;
    },
    {
      VOD: { min: Infinity, max: -Infinity },
      PHY: { min: Infinity, max: -Infinity },
      ETOP: { min: Infinity, max: -Infinity },
    }
  );

  Object.entries(groupMinAndMaxValuesByType).forEach(
    async ([type, { min, max }]) => {
      const currentEntry = latest3Entries.find((idkpi) => idkpi.type === type);
      if (!currentEntry) return;
      const alertType = getAlertType(currentEntry.value, min, max);
      currentEntry.isTrusted = !alertType;
      await IDKPIRepository.save(currentEntry);
      if (!alertType) return;
      const alert = new Alert();
      alert.type = alertType;
      alert.IDKPI = currentEntry;
      await AlertRepository.save(alert);
    }
  );
};

AppDataSource.initialize()
  .then(async () => {
    // create new idkpi
    schedule("0 * * * *", cronJob);
  })
  .catch((error) => console.log(error));
