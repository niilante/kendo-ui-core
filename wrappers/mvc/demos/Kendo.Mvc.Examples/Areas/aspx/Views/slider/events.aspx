<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">

<div class="demo-section k-content">
    <ul id="fieldlist">
        <li>
            <label>Temperature</label>
<%= Html.Kendo().Slider()
        .Name("slider")
        .Min(0)
        .Max(30)
        .SmallStep(1)
        .LargeStep(10)
        .Value(18)
        .Events(events => events
            .Slide("sliderSlide")
            .Change("sliderChange"))
        .HtmlAttributes(new { @class = "temperature" })
  %>
        </li>
        <li>
            <label>Humidity</label>
<%= Html.Kendo().RangeSlider()
        .Name("rangeslider")
        .Min(0)
        .Max(10)
        .SmallStep(1)
        .LargeStep(10)
        .Events(events => events
            .Slide("rangeSliderSlide")
            .Change("rangeSliderChange"))
        .HtmlAttributes(new { @class = "humidity" })
%>
        </li>
    </ul>
</div>

<div class="box">
    <h4>Console log</h4>
    <div class="console"></div>
</div>

<script>
    function sliderSlide(e) {
        kendoConsole.log("Slide :: new slide value is: " + e.value);
    }

    function sliderChange(e) {
        kendoConsole.log("Change :: new value is: " + e.value);
    }

    function rangeSliderSlide(e) {
        kendoConsole.log("Slide :: new slide values are: " + e.values.toString().replace(",", " - "));
    }

    function rangeSliderChange(e) {
        kendoConsole.log("Change :: new values are: " + e.values.toString().replace(",", " - "));
    }
</script>

<style>
   #fieldlist {
       margin: 0 0 -2em;
       padding: 0;
       text-align: center;
   }

   #fieldlist > li {
       list-style: none;
       padding-bottom: 2em;
   }

   #fieldlist label {
       display: block;
       padding-bottom: 1em;
       font-weight: bold;
       text-transform: uppercase;
       font-size: 12px;
       color: #444;
   }
</style>
</asp:Content>