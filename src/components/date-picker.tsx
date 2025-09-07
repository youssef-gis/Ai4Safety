"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { useImperativeHandle } from "react"

export type ImperativeHandleFromDatePicker = {
  reset: () => void;
};

type DatePickerProps = {
    id:  string;
    name: string;
    defaultValue?: string | undefined;
    imperativeHandleRef?: React.RefObject<ImperativeHandleFromDatePicker | null>;
};

const DatePicker = ({id, name, defaultValue,imperativeHandleRef,}: DatePickerProps)  => {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ?  new Date(defaultValue) : new Date()
  );

useImperativeHandle(imperativeHandleRef, () => ({
    reset: () => setDate(new Date()),
  }));

const formattedDate = date ? format(date, 'yyyy-MM-dd') : "";

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full" id={id} asChild>
          <Button
            variant="outline"
           
            className="justify-start text-left-font-normal"
          >
            {formattedDate}
            <input type="hidden" name={name} value={formattedDate}  />
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
};

export { DatePicker};
