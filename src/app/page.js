"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, RefreshCw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      let { data: ignoreReminder, error } = await supabase
        .from("ignore-reminder")
        .select("*");

      if (error) console.error("Error fetching data:", error);
      else {
        setAlerts(ignoreReminder || []);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const alertsFiltered = alerts.filter(
    (alert) =>
      alert.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      alert.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      alert.channel?.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAlert = {
      id: uuidv4(),
      title,
      channel,
      description,
      reference: link,
      time_end: new Date(
        new Date(timeEnd).getTime() + 8 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("ignore-reminder")
        .insert([newAlert])
        .select();

      if (error) console.error("Error inserting data:", error);
      else {
        await fetchData();
        setIsModalOpen(false);
        // Reset form
        setTitle("");
        setChannel("");
        setDescription("");
        setLink("");
        setTimeEnd("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data, error } = await supabase
        .from("ignore-reminder")
        .delete()
        .eq("id", id);

      if (error) console.error("Error deleting data:", error);
      else await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-slate-100">
      <div
        className={`sticky top-0 z-10 pt-5 flex flex-col gap-4 bg-white shadow-md px-5 pb-2`}>
        <div className="flex justify-between items-center">
          <h6 className="text-lg font-semibold">
            Alerts {lastFetch && `• Last fetch: ${lastFetch.toLocaleString()}`}
            <Button onClick={fetchData} variant="ghost" className="text-[12px]">
              <RefreshCw />
            </Button>
          </h6>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Add New Alert
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="dialog-animation">
            <DialogHeader>
              <DialogTitle>Add New Alert</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  label="Title"
                />
                <FilterSearchInput
                  searchList={alerts
                    .map((alert) => alert.channel)
                    .filter(
                      (value, index, self) => self.indexOf(value) === index
                    )}
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  required
                  label="Channel"
                />
                <Input
                  type="text"
                  placeholder="Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  label="Link"
                />
                <Input
                  type="datetime-local"
                  placeholder="Time End"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  required
                  label="Time End"
                />
              </div>
              <div className="flex mt-3">
                <Textarea
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  label="Description"
                />
              </div>
              <div className="flex mt-3">
                <Button type="submit">Add Alert</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <main className="bg-white dark:bg-slate-800 min-h-screen relative p-5">
        <div className="mt-5 flex flex-col gap-2">
          {alertsFiltered
            .filter(
              (alert) =>
                alert.time_end === null || new Date(alert.time_end) > new Date()
            )
            .sort((a, b) => new Date(a.time_end) - new Date(b.time_end))
            .map((alert) => (
              <Card key={alert.id}>
                <CardContent className={"py-1 px-2"}>
                  <Collapsible>
                    <div className="flex items-center justify-between space-x-4 ">
                      <div className="flex flex-col">
                        <h4 className="text-sm">{alert.title}</h4>
                        <div className="text-[12px] font-semibold ">
                          {alert.channel}
                        </div>
                        <div className="text-[12px]  text-opacity-60 italic">
                          Until{" "}
                          {alert.time_end
                            ? new Date(alert.time_end).toLocaleString()
                            : "N/A"}
                        </div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <Separator />
                      <div className="flex flex-col gap-2 py-2 ">
                        {alert.description}
                        {alert.reference && (
                          <Button>
                            <a
                              href={alert.reference}
                              target="_blank"
                              rel="noreferrer">
                              Read More
                            </a>
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(alert.id)}
                          variant="danger">
                          Delete
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}

function FilterSearchInput({ searchList = [], value = "", onChange, label,...props }) {
  const [isClient, setIsClient] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Ensure searchList is an array and not undefined
  const items = searchList ? (Array.isArray(searchList) ? searchList : []) : [];

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        {...props}
      />

      {isFocused && (
        <div className="absolute z-10 min-w-[220px] mt-[72px] bg-white border border-gray-200 rounded-md shadow-lg"
        >
          {items.filter(
            (item) =>
              item.toLowerCase().indexOf(value.toLowerCase()) > -1
          ).map((item) => (
            <div
              key={item}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange({ target: { value: item } });
                setIsFocused(false);
              }}>
              {item}
            </div>
          ))}
          {items.length === 0 && <div className="p-2">No items found</div>}
        </div>
      )}
    </div>
  );
}
