import React, { useEffect, useState } from "react";
import { useLoading } from "../../../context";
import { useAxios } from "../../../hooks/useAxios";
import { useForm } from "../../../hooks/useForm";
import { RoomsForm } from "../../../interfaces/forms.type";
import {
  BuildingsOptionsResponse,
  RoomsInfo,
  RoomsResponse,
} from "../../../interfaces/responses.type";
import { searchSchema } from "../../../schemas";
import { InputSelectOption } from "../../shared/InputSelect/types";
import RoomsPresenter from "../RoomsPresenter/RoomsPresenter";

export default function RoomsContainer() {
  const today = new Date().toISOString();
  const [values, handleChange, validateForm] = useForm<RoomsForm>(
    {
      date: today.substring(0, today.indexOf("T")),
      building: { value: "", text: "" },
      room: { value: "", text: "" },
    },
    searchSchema
  );
  const { showLoader, hideLoader } = useLoading();
  const [data, fetchData] = useAxios<RoomsResponse>(
    `/rooms/availability/${values.date}/${values.room.value}`
  );
  const [fetchedOptions] = useAxios<BuildingsOptionsResponse[]>(
    "/rooms/buildings",
    true
  );
  const [buildingsOptions, setBuildingsOptions] = useState<InputSelectOption[]>(
    []
  );
  const [roomsOptions, setRoomsOptions] = useState<InputSelectOption[]>([]);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  const handleFormChange = (e: any) => {
    if (e["building"] || e["room"]) {
      const name = Object.keys(e)[0];
      handleChange({ target: { name: name, value: e[name] } });
      if (e["building"] && fetchedOptions) {
        let building = fetchedOptions.find(
          (building: BuildingsOptionsResponse) =>
            building.id === e["building"].value
        );
        if (building) {
          let roomsOptions = building.prostorije.map((room: RoomsInfo) => ({
            text: room.ime,
            value: room["-id"],
          }));
          setRoomsOptions(roomsOptions);
        }
      }
    } else handleChange(e);
  };

  const handleSearch = () => {
    showLoader();
    validateForm()
      .then(() =>
        fetchData().then(() => {
          hideLoader();
        })
      )
      .catch(() => hideLoader());
  };

  const handleStatsOverlay = () => {
    setIsStatsOpen(!isStatsOpen);
  };

  useEffect(() => {
    if (fetchedOptions) {
      const buildingsOptions = fetchedOptions.map((building: any) => {
        return { text: building.naziv, value: building.id };
      });
      setBuildingsOptions(buildingsOptions);
    }
  }, [fetchedOptions]);

  return (
    <RoomsPresenter
      values={values}
      calendarEvents={data}
      handleFormChange={handleFormChange}
      handleSearch={handleSearch}
      toggleStatsOverlay={handleStatsOverlay}
      isStatsOpen={isStatsOpen}
      buildingsOptions={buildingsOptions}
      roomsOptions={roomsOptions}
    />
  );
}
