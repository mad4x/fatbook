import {ArrowLeftRight, Files, Users} from "lucide-react";

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
    },
    {
        "href": "/vicepresidenza/avvisi",
        "title": "Gestione avvisi",
        "description": "Crea avvisi e gestisci le bozze",
        "icon": <Files size={32} />
    },
    {
        "href": "/vicepresidenza/sostituzioni",
        "title": "Controlla sostituzioni",
        "description": "Sostituisci i docenti assenti",
        "icon": <ArrowLeftRight size={32} />
    },
    {
        "href": "/vicepresidenza/assenze",
        "title": "Storico assenze",
        "description": "Traccia e gestisci le assenze",
        "icon": <Users size={32} />
    }
]