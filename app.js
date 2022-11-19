const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      fileName: dbPath,
      driver: sqlite3.database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:/3000/");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject=(dbObject)=>{
 return{
   stateId:dbObject.state_id,
   stateName:dbObject.state_name,
   population:dbObject.population
 };
};

const convertDistrictDbObjectToResponseObject=(dbObject)=>{
    return{
        districtId:dbObject.district_id,
        districtName:dbObject.district_name,
        stateId:dbObject.state_id,
        cases:dbObject.cases,
        cured:dbObject.cured,
        active:dbObject.active,
        deaths:dbObject.deaths,
    };
};

app.get("/states/",async(request,response)=>{
    const getStatesQuery=`
          select *
           From
            state;`;
    const statesArray=await db.all(getStatesQuery);
    response.send(statesArray.map((eachState)=>
        convertStateDbObjectToResponseObject(eachState)));
    
});

app.get("/states/:stateId",async(request,response)=>{
    const {stateId} =request.params;
    const getStateQuery=`
        select *
          From
           state
           where
             state_id=${stateId};`;
    const state=await db.get("getStateQuery");
    response.send(convertStateDbObjectToResponseObject(state));

});

app.post("/districts/",async(request,response)=>{
    const {districtName,stateId,cases,cured,active,deaths}=request.body;
    const postDistrictQuery=`
    INSERT INTO
      district(district_name,stateI_d,cases,cured,active,deaths)
    VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
    await database.run(postDistrictQuery);
    response.send("District Successfully Added");
});

app.delete("/districts/:districtId/",(request,response)=>{
    const {districtId}=request.params;
    const deleteDistrictQuery=`
      select *
      From
        district
        Where district_Id=${districtId};`;
    await database.run(deleteDistrictQuery);
    response.send("District Removed")
});

app.put("/districts/:districtId/",async(request,response)=>{
   const {district_Id}=request.params;
   const{districtName,stateId,cases,cured,active,deaths}=response.body;
   const updateDistrictQuery=`
   update
      District
   SET
      district_name='${districtName}',
      state_id=${stateId},
      cases=${cases},
      cured=${cured},
      active=${active},
      deaths=${deaths}
      where district_Id=${districtId};`;
    await db.run(updateDistrictQuery);
    response.send("District Details Updated");

});

app.get("/states/:stateId/stats/",async(request,response)=>{
    const {stateId}=request.params;
    const getStatesStatQuery=`
      select 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
      From
         District
      where state_ID=${stateId};`;
    const stats=await db.run(getStatesStatQuery);
    response.send({
        TotalCases:stats["SUM(cases)"],
        TotalCured:stats["SUM(cured)"],
        TotalActive:stats["SUM(active)"],
        TotalDeaths:stats["SUM(deaths)"]

    });      
});

app.get("/district/:districtId/details/",async(request,response)=>{
    const {districtId}=request.params;
    const getStateNameQuery=`
    select 
    state_name 
    from district
     Natural join
     state
     where
      district_Id=${districtId};`;
    const state=await db.run(getStateNameQuery)
    response.send({stateName:state.state_name});
});
module.exports=app;
