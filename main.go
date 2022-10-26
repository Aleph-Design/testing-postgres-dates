package main

import (
	_ "github.com/lib/pq"
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"
)

var db *sql.DB

var tpl *template.Template

type DateTime struct {
	SD__ string
	ST__ string
	Now_ time.Time
	Date string
	Time string
	Zone string
	Dtl_ time.Time
	RFC3 string
}

const (
	host = "localhost"
	port = "5432"
	user = "janhkila"
	pass = ""
	name = "test_connect"
)

func init() {
	tpl = template.Must(template.ParseGlob("templates/*"))
}

func main() {
	// make database connection port=5432
	conn := fmt.Sprintf("host=%s port=%s user=%s password=%s name=%s sslmode=disable", host, port, user, pass, name)
	db, err := sql.Open("postgres", conn)
	if err != nil {
		log.Println("Failed open DB")
		return
	}
	defer db.Close()
	if err = db.Ping(); err != nil {
		log.Println("Ping error")
		return
	}
	log.Println("Connected to database...")

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/upload", uploadHandler)

	/*
		Tell GO where to find static files
		==================================
	*/
	fileServer := http.FileServer(http.Dir("./static/"))
	http.Handle("/static/", http.StripPrefix("/static/", fileServer))

	fmt.Println("Server running on port 5000...")
	http.ListenAndServe(":5000", nil)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tpl.ExecuteTemplate(w, "index.tmpl", nil)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// w.Write([]byte("uploadHandler"))
	if r.Method != "POST" {
		fmt.Println("MOET METHOD POST ZIJN!")
		http.Error(w, "Ongeldige methode!", http.StatusMethodNotAllowed)
		return
	}
	// populate r.Form and r.PostForm
	err := r.ParseForm()
	if err != nil {
		fmt.Println("something rotten...")
	}
	sd := r.Form.Get("start-date")
	st := r.Form.Get("start-time")
	fmt.Printf("Startdate: %s  StartTime: %s\n", sd, st)

	t := time.Now()
	z, _ := t.Zone()
	dateTime := DateTime{}
	dateTime.SD__ = sd
	dateTime.ST__ = st
	dateTime.Now_ = t
	dateTime.Date = t.Format("02-01-2006")
	dateTime.Time = t.Format("15:04")
	dateTime.Zone = z
	dateTime.Dtl_ = ConvertDTZ(w, sd, st)
	dateTime.RFC3 = ConvertRFC(w, sd, st)

	err = InsertDates(dateTime)
	if err != nil {
		log.Println("Insert error: ", err)
	}

	tpl.ExecuteTemplate(w, "index.tmpl", dateTime)
} // End uploadHandler() -----------------------------------------

func ConvertDTZ(w http.ResponseWriter, sd, st string) time.Time {
	const dtf = "02-01-2006 15:04 MST"
	// get local zone CEST
	z, _ := time.Now().Zone()
	if sd == "" || st == "" {
		return time.Time{}
	} else {
		// get dateTimeZone
		dtz := sd + " " + st + " " + z
		// convert dtz to dtl 'dateTimeLocal'
		dtl, err := time.Parse(dtf, dtz)
		if err != nil {
			log.Print("convert to time error: ", err)
			return time.Time{}
		}
		return dtl
	}
}

func ConvertRFC(w http.ResponseWriter, sd, st string) string {
	const dtf = "02-01-2006 15:04"
	if sd == "" || st == "" {
		return time.Now().Format(time.RFC3339)
	} else {
		// get dateTime
		dt := sd + " " + st
		// convert dtz to dtl 'dateTimeLocal'
		rfc, err := time.Parse(dtf, dt)
		if err != nil {
			log.Print("convert to time error: ", err)
			return time.Now().Format(time.RFC3339)
		}
		return rfc.Format(time.RFC3339)
	}
}

// insert into database test_connect table users
func InsertDates(data DateTime) error {
	// fmt.Println("date: ", data.RFC3)	// OK
	// stmt := `insert into users (start_unaware, start_aware, updated_at) values ($1, $2, $3)`
	// fmt.Println("stmt: ", stmt)	// OK

	FirstName := "Jan"
	LastName := "Banaan"

	stmt := `insert into users (first_name, last_name) values ($1, $2,)`

	// _, err := db.Exec(stmt, data.RFC3, data.RFC3, time.Now(),)

	_, err := db.Exec(stmt, FirstName, LastName)
	if err != nil {
		fmt.Println("insert err: ", err)
		return err
	}
	return nil
}
