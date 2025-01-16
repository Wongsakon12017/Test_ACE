const { createApp } = Vue; 

createApp({
  data() { 
    return {
      launches: [], 
      selectedLaunch: null, 
      rockets: {},
      crewMembers: {},
      sortOp: 'name',
      sortOr: 'asc'
    };
  },
  methods: {
    //fetch API
    async fetchLaunches() {
      try {
        // lunches
        const response = await fetch('https://api.spacexdata.com/v4/launches');
        const launches = await response.json();

        // Rocket
        const rocketResponse = await fetch('https://api.spacexdata.com/v4/rockets');
        const rockets = await rocketResponse.json();

        //Crews
        const crewResponse = await fetch('https://api.spacexdata.com/v4/crew');
        const crewMember = await crewResponse.json();

        // เก็บข้อมูลจรวดแบบ key-value
        this.rockets = rockets.reduce((acc, rocket) => {
          acc[rocket.id] = rocket; //ถ้า key ที่ชื่อ acc เป็น id ตรงกับตัวไหนก็ return จรวดตัวนั้นๆออกไป
          return acc;
        }, {});

        this.crewMembers = crewMember.reduce((acc, crew) => {
          acc[crew.id] = crew;
          return acc;
        }, {});
        
        this.launches = launches.map(launch => ({
          ...launch,
          rocketDetails: this.rockets[launch.rocket] || {}, //ค้นหาโดยใช้ lunach.rocket เป็น Key
          crews: launch.crew 
            ? launch.crew.map(crewId => this.crewMembers[crewId]?.name || []): "None", //map แปลง lunch.crew เป็น name จาก this.crewMember ใช้ crewId เป็น Key
          detailsRocket: launch.details || "None", //แสดงค่าใน lunch.details
          statusRocket: launch.upcoming ? "Upcoming" : launch.success === true ? "Success" : "Failed" //ถ้าค่าใน field upcoming เป็น true จะแสดงเป็น Upcoming และถถ้า launch.success เป็น true จะแสดง Success false จะแสดง Field
        }));

        this.sortLaunch();
        

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    showDetails(launch) {
      this.selectedLaunch = launch;
    },
    closeModal() {
      this.selectedLaunch = null;
    },
    sortLaunch() {
      this.launches.sort((a, b) => {
        //ถ้า this.sortOp = name เรียง a.name,b.name หรือ ถ้าเป็น date ในการเรียงแล้วแปลงเป็น Date obj
        const fieldA = this.sortOp === 'name' ? a.name.toLowerCase() : new Date(a.date_utc);
        const fieldB = this.sortOp === 'name' ? b.name.toLowerCase() : new Date(b.date_utc);

        if (fieldA < fieldB) return this.sortOr === 'asc' ? -1 : 1; //return -1 คือน้อยไปมาก 1 คือมากไปน้อย
        if (fieldA > fieldB) return this.sortOr === 'asc' ? 1 : -1;
        return 0;
      })
    },
    setSortOp(option) {
      if (this.sortOp === option) {
        this.sortOr = this.sortOr === 'asc' ? 'desc' : 'asc'; //ถ้า this.sortOp = option จะสลับค่า asc เป็น desc หรือ desc เป็น asc
      } else {
        this.sortOp = option;
        this.sortOr = 'asc';
      }
      this.sortLaunch();
    },
  },
  mounted() {
    this.fetchLaunches();
  },
}).mount('#app');
