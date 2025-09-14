import { format } from 'date-fns';
import { BrushCleaning, ClockArrowDownIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';

export default function CalendarDatetime({
  selected,
  time = true,
  onSelect,
}: {
  selected: Date | undefined;
  time?: boolean;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <>
      <Calendar
        mode="single"
        required={true}
        selected={selected}
        captionLayout="dropdown"
        onSelect={onSelect}
        showOutsideDays
        className="!bg-transparent"
      />
      <div className="flex items-center justify-center gap-2 px-4 pb-2">
        {time && (
          <>
            <Input
              type="time"
              value={selected ? format(selected, 'HH:mm') : ''}
              onChange={(e) => {
                if (!selected) return;
                const newDate = new Date(selected);
                if (time) {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  newDate.setHours(hours);
                  newDate.setMinutes(minutes);
                }
                onSelect(newDate);
              }}
              className="w-25 justify-end"
            />

            <Button onClick={() => onSelect(new Date())}>
              <ClockArrowDownIcon className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button variant="outline" onClick={() => onSelect(undefined)}>
          <BrushCleaning className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
