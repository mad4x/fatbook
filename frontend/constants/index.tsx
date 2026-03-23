import {Users} from "lucide-react";

export const SIDEBAR_ELEMENTS = [
  {
    title: "Dashboard",
    url: "/dashboard"
  },
  {
    title: "Orario",
    url: "/orario"
  },
  {
    title: "Assenze",
    url: "/assenze"
  },
  {
    title: "Avvisi",
    url: "/avvisi"
  },
  {
    title: "Impostazioni",
    url: "/impostazioni"
  }

];

export const PANNELLO_VICEPRESIDE_ELEMENTS = [
    {
        "href": "/vicepresidenza/docenti",
        "title": "Gestione Docenti",
        "description": "Aggiungi o rimuovi professori",
        "icon": <Users size={32} />
    }
]